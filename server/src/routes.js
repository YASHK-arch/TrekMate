import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { User,TrekStaff,Admin,Trek,Booking } from './models.js';
import { getTrekImageFilename } from './trek-images.js';
dotenv.config();
const router=Router();
const cloudinaryCredentials={
 cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
 api_key:process.env.CLOUDINARY_API_KEY,
 api_secret:process.env.CLOUDINARY_API_SECRET
};
const cloudinaryConfigured=Object.values(cloudinaryCredentials).every(Boolean);
if(cloudinaryConfigured)cloudinary.config(cloudinaryCredentials);
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:8*1024*1024},fileFilter:(_req,file,cb)=>{
 if(!file.mimetype.startsWith('image/'))return cb(new Error('Only image files are allowed.'));
 cb(null,true);
}});
const handleImageUpload=(req,res,next)=>upload.single('image')(req,res,error=>{
 if(error)return res.status(error.code==='LIMIT_FILE_SIZE'?413:400).json({message:error.message});
 next();
});
const uploadToCloudinary=file=>new Promise((resolve,reject)=>{
 if(!cloudinaryConfigured){const error=new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');error.status=503;return reject(error);}
 cloudinary.uploader.upload_stream({folder:'trekmate/treks',resource_type:'image'},(error,result)=>{
  if(error){error.status=502;return reject(error);}
  if(!result?.secure_url)return reject(Object.assign(new Error('Cloudinary did not return a secure image URL.'),{status:502}));
  resolve(result.secure_url);
 }).end(file.buffer);
});
const secret=()=>process.env.JWT_SECRET||'development-secret-change-me';
const publicUser=(u)=>({_id:u._id,id:u._id,name:u.name,email:u.email||u.contactDetails,role:u.role,status:u.status});
function auth(req,res,next){
 const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 try{if(!token)throw Error();req.auth=jwt.verify(token,secret());next();}
 catch{return res.status(401).json({message:'Please log in to continue.'});}
}
function allow(...roles){return async(req,res,next)=>{try{
 const Model={User,TrekStaff,Admin}[req.auth.role]; const user=await Model?.findById(req.auth.id);
 if(!user)return res.status(401).json({message:'Account not found.'});
 if(!roles.includes(user.role))return res.status(403).json({message:'You do not have permission to access this resource.'});
 if(user.status==='Blacklisted')return res.status(403).json({message:'Your account has been blacklisted.'});
 if(user.role==='Staff'&&user.status!=='Approved')return res.status(403).json({message:'Your staff account is awaiting approval.'});
 req.user=user;next();
 }catch(e){res.status(500).json({message:e.message});}}}
const safeTrek=t=>{
 const legacyFilename=t.imageFilename&&!/^https?:\/\//i.test(t.imageFilename)?`/static/uploads/${t.imageFilename}`:'';
 const imageUrl=t.imageUrl&&!/^https?:\/\/images\.unsplash\.com\//i.test(t.imageUrl)?t.imageUrl:legacyFilename||`/static/uploads/${getTrekImageFilename(t.region||t.location)}`;
 return {...t.toObject(),id:t._id,assignedStaffId:t.assignedStaff?._id||t.assignedStaff||null,assignedStaffName:t.assignedStaff?.name||null,imageUrl};
};
const populateTrek='assignedStaff';
const getTrek=async(id)=>Trek.findById(id).populate(populateTrek);
router.post('/auth/register',async(req,res)=>{try{
 const {name,email,password,confirmPassword,role='User'}=req.body;
 if(!name||!email||!password)return res.status(400).json({message:'Name, email/contact, and password are required.'});
 if(password!==confirmPassword)return res.status(400).json({message:'Passwords do not match.'});
 if(role==='Admin')return res.status(400).json({message:'Admin registration is not allowed.'});
 if(!['User','Staff'].includes(role))return res.status(400).json({message:'Invalid role.'});
 const Model=role==='Staff'?TrekStaff:User; const key=role==='Staff'?'contactDetails':'email';
 if(await Model.findOne({[key]:email}))return res.status(409).json({message:'An account with this email/contact already exists.'});
 const u=await Model.create({name,[key]:email,passwordHash:await bcrypt.hash(password,12),role});
 res.status(201).json({message:role==='Staff'?'Registration successful. Your account requires admin approval.':'Registration successful. Please log in.'});
 }catch(e){res.status(500).json({message:e.code===11000?'Account already exists.':e.message});}});
router.post('/auth/login',async(req,res)=>{try{
 const {email,password}=req.body; let u=await User.findOne({email:email?.toLowerCase()});
 if(!u)u=await TrekStaff.findOne({contactDetails:email});
 if(!u)u=await Admin.findOne({email:email?.toLowerCase()});
 if(!u||!await bcrypt.compare(password||'',u.passwordHash))return res.status(401).json({message:'Invalid credentials.'});
 if(u.status==='Blacklisted')return res.status(403).json({message:'Your account has been blacklisted. Please contact admin.'});
 if(u.role==='Staff'&&u.status!=='Approved')return res.status(403).json({message:'Your staff account is not approved yet.'});
 const token=jwt.sign({id:u._id,role:u.role},secret(),{expiresIn:'7d'});
 res.json({token,user:publicUser(u)});
 }catch(e){res.status(500).json({message:e.message});}});
router.get('/auth/me',auth,async(req,res)=>{const Model={User,TrekStaff,Admin}[req.auth.role];const u=await Model.findById(req.auth.id);if(!u)return res.status(401).json({message:'Account not found'});res.json({user:publicUser(u)});});
router.patch('/profile',auth,async(req,res)=>{try{
 const Model={User,TrekStaff,Admin}[req.auth.role];const u=await Model.findById(req.auth.id);
 if(req.body.name)u.name=req.body.name;
 if(req.auth.role==='Staff'&&req.body.email)u.contactDetails=req.body.email;
 if(req.auth.role!=='Staff'&&req.body.email)u.email=req.body.email;
 if(req.body.password)u.passwordHash=await bcrypt.hash(req.body.password,12);
 await u.save();res.json({user:publicUser(u),message:'Profile updated successfully.'});
 }catch(e){res.status(400).json({message:e.code===11000?'Email already in use.':e.message});}});
router.get('/treks',async(req,res)=>{try{
 const q={};if(req.query.status)q.status=req.query.status;else if(req.query.public==='true')q.status={$in:['Approved','Open']};
 if(req.query.location)q.location={$regex:req.query.location,$options:'i'};
 if(req.query.difficulty)q.difficulty=req.query.difficulty;
 const treks=await Trek.find(q).populate(populateTrek).sort({startDate:1});res.json(treks.map(safeTrek));
 }catch(e){res.status(500).json({message:e.message});}});
router.get('/treks/:id',auth,async(req,res)=>{const t=await getTrek(req.params.id);if(!t)return res.status(404).json({message:'Trek not found'});res.json(safeTrek(t));});
router.post('/treks',auth,allow('Admin'),handleImageUpload,async(req,res)=>{try{
 const b=req.body;const startDate=new Date(b.startDate),endDate=new Date(b.endDate);
 if(!(endDate>startDate))return res.status(400).json({message:'End date must be strictly after the start date.'});
 if(+b.availableSlots<1||+b.duration<1)return res.status(400).json({message:'Slots and duration must be positive integers.'});
  const imageUrl=req.file?await uploadToCloudinary(req.file):`/static/uploads/${getTrekImageFilename(b.region||b.location)}`;
  const t=await Trek.create({name:b.name,location:b.location,region:b.region||b.location,difficulty:b.difficulty,duration:+b.duration,availableSlots:+b.availableSlots,assignedStaff:b.assignedStaffId||null,startDate,endDate,status:b.assignedStaffId?'Approved':'Pending',description:b.description||'',imageUrl});
  res.status(201).json({trek:safeTrek(await getTrek(t._id)),message:'Trek added successfully.'});
 }catch(e){res.status(e.status||400).json({message:e.message});}});
 router.patch('/treks/:id',auth,allow('Admin'),handleImageUpload,async(req,res)=>{try{
  const t=await Trek.findById(req.params.id);if(!t)return res.status(404).json({message:'Trek not found'});
  for(const k of ['name','location','difficulty','description'])if(req.body[k]!==undefined)t[k]=req.body[k];
  for(const k of ['duration','availableSlots'])if(req.body[k]!==undefined)t[k]=Number(req.body[k]);
  if(req.body.startDate)t.startDate=new Date(req.body.startDate);if(req.body.endDate)t.endDate=new Date(req.body.endDate);
  if(req.body.assignedStaffId!==undefined)t.assignedStaff=req.body.assignedStaffId||null;
  if(req.file){t.imageUrl=await uploadToCloudinary(req.file);t.imageFilename='';}
  else if(!t.imageUrl&&!t.imageFilename)t.imageUrl=`/static/uploads/${getTrekImageFilename(t.region||t.location)}`;
  if(req.body.location!==undefined)t.region=req.body.region||req.body.location;
  if(!(t.endDate>t.startDate)||t.duration<1||t.availableSlots<0)return res.status(400).json({message:'Check dates, duration, and available slots.'});
  await t.save();res.json({trek:safeTrek(await getTrek(t._id)),message:'Trek updated successfully.'});
 }catch(e){res.status(e.status||400).json({message:e.message});}});
router.delete('/treks/:id',auth,allow('Admin'),async(req,res)=>{const t=await Trek.findByIdAndDelete(req.params.id);if(!t)return res.status(404).json({message:'Trek not found'});await Booking.deleteMany({trek:t._id});res.json({message:'Trek deleted successfully.'});});
router.post('/treks/:id/book',auth,allow('User'),async(req,res)=>{try{
 const t=await Trek.findById(req.params.id);if(!t)return res.status(404).json({message:'Trek not found'});
 if(t.status!=='Open')return res.status(400).json({message:'This trek is not currently open for booking.'});
 if(t.availableSlots<=0)return res.status(400).json({message:'Sorry, this trek is fully booked.'});
 let b=await Booking.findOne({user:req.user._id,trek:t._id});
 if(b&&b.status!=='Cancelled')return res.status(409).json({message:'You have already booked this trek.'});
 if(b)b.status='Booked';else b=new Booking({user:req.user._id,trek:t._id,status:'Booked'});
 // Atomically reserve a slot to avoid overbooking.
 const updated=await Trek.findOneAndUpdate({_id:t._id,status:'Open',availableSlots:{$gt:0}},{$inc:{availableSlots:-1}},{new:true});
 if(!updated)return res.status(409).json({message:'Sorry, this trek is fully booked.'});
 try{await b.save();}catch(e){await Trek.updateOne({_id:t._id},{$inc:{availableSlots:1}});throw e;}
 res.status(201).json({message:'Booking successful!',booking:b});
 }catch(e){res.status(400).json({message:e.code===11000?'You have already booked this trek.':e.message});}});
router.get('/bookings/mine',auth,allow('User'),async(req,res)=>{const bs=await Booking.find({user:req.user._id}).populate({path:'trek',populate:{path:'assignedStaff'}}).sort({bookingDate:-1});res.json(bs.map(b=>({...b.toObject(),id:b._id,trek:b.trek?safeTrek(b.trek):null})));});
router.post('/bookings/:id/cancel',auth,allow('User'),async(req,res)=>{const b=await Booking.findOne({_id:req.params.id,user:req.user._id});if(!b)return res.status(404).json({message:'Booking not found'});if(b.status==='Booked'){b.status='Cancelled';await b.save();await Trek.updateOne({_id:b.trek},{$inc:{availableSlots:1}});}res.json({message:'Booking cancelled successfully.'});});
router.get('/admin/bookings',auth,allow('Admin'),async(req,res)=>{const bs=await Booking.find().sort({bookingDate:-1}).populate('user').populate('trek');res.json(bs.map(b=>({...b.toObject(),id:b._id})));});
router.get('/admin/summary',auth,allow('Admin'),async(req,res)=>{const [totalTreks,totalUsers,totalStaff,totalBookings,recentBookings,popular]=await Promise.all([
 Trek.countDocuments(),User.countDocuments(),TrekStaff.countDocuments(),Booking.countDocuments(),
 Booking.find().sort({bookingDate:-1}).limit(5).populate('user').populate('trek'),
 Booking.aggregate([{$group:{_id:'$trek',bookingCount:{$sum:1}}},{$sort:{bookingCount:-1}},{$limit:5},{$lookup:{from:'treks',localField:'_id',foreignField:'_id',as:'trek'}},{$unwind:{path:'$trek',preserveNullAndEmptyArrays:true}}])
 ]);
 const statuses=await Booking.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]);res.json({totalTreks,totalUsers,totalStaff,totalBookings,recentBookings:recentBookings.map(b=>({...b.toObject(),id:b._id})),popularTreks:popular.map(p=>({trek_name:p.trek?.name||'Deleted trek',booking_count:p.bookingCount})),statusDistribution:Object.fromEntries(statuses.map(s=>[s._id,s.count]))});
});
router.get('/admin/users',auth,allow('Admin'),async(req,res)=>{const q=req.query.search?.trim();let filter={};if(q)filter={$or:[{name:{$regex:q,$options:'i'}},{_id:/^[0-9a-f]{24}$/i.test(q)?q:null}]};res.json((await User.find(filter).sort({createdAt:-1})).map(publicUser));});
router.patch('/admin/users/:id/toggle-blacklist',auth,allow('Admin'),async(req,res)=>{const u=await User.findById(req.params.id);if(!u)return res.status(404).json({message:'User not found'});u.status=u.status==='Blacklisted'?'Active':'Blacklisted';await u.save();res.json({user:publicUser(u),message:`User ${u.name} status updated.`});});
router.get('/admin/staff',auth,allow('Admin'),async(req,res)=>res.json((await TrekStaff.find().sort({createdAt:-1})).map(publicUser)));
router.patch('/admin/staff/:id/status',auth,allow('Admin'),async(req,res)=>{if(!['Pending','Approved','Rejected','Blacklisted'].includes(req.body.status))return res.status(400).json({message:'Invalid staff status'});const s=await TrekStaff.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});if(!s)return res.status(404).json({message:'Staff not found'});res.json({user:publicUser(s),message:'Staff status updated.'});});
router.get('/staff/summary',auth,allow('Staff'),async(req,res)=>{const treks=await Trek.find({assignedStaff:req.user._id}).sort({startDate:1});const ids=treks.map(t=>t._id);const participants=await Booking.countDocuments({trek:{$in:ids}});res.json({treks:treks.map(safeTrek),totalAssigned:treks.length,openTreks:treks.filter(t=>t.status==='Open').length,totalParticipants:participants});});
router.get('/staff/treks/:id',auth,allow('Staff'),async(req,res)=>{const t=await getTrek(req.params.id);if(!t||String(t.assignedStaff?._id)!==String(req.user._id))return res.status(404).json({message:'Assigned trek not found'});const bs=await Booking.find({trek:t._id}).populate('user');res.json({trek:safeTrek(t),bookings:bs});});
router.patch('/staff/treks/:id/status',auth,allow('Staff'),async(req,res)=>{const t=await Trek.findOne({_id:req.params.id,assignedStaff:req.user._id});if(!t)return res.status(404).json({message:'Assigned trek not found'});const status=req.body.status;if(!['Approved','Open','Started','Completed'].includes(status))return res.status(400).json({message:'Invalid status.'});t.status=status;await t.save();if(status==='Completed')await Booking.updateMany({trek:t._id,status:'Booked'},{$set:{status:'Completed'}});res.json({message:`Trek status updated to ${status}.`,trek:safeTrek(t)});});
router.get('/users/:id',async(req,res)=>{const u=await User.findById(req.params.id);if(!u)return res.status(404).json({message:'User not found'});res.json({id:u._id,name:u.name,email:u.email,role:u.role});});
router.get('/bookings/stats',async(req,res)=>{const popular=await Booking.aggregate([{$group:{_id:'$trek',booking_count:{$sum:1}}},{$sort:{booking_count:-1}},{$limit:5},{$lookup:{from:'treks',localField:'_id',foreignField:'_id',as:'trek'}},{$unwind:{path:'$trek',preserveNullAndEmptyArrays:true}},{$project:{trek_name:{$ifNull:['$trek.name','Deleted trek']},booking_count:1}}]);const stats=await Booking.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]);res.json({popular_treks:popular,status_distribution:Object.fromEntries(stats.map(x=>[x._id,x.count]))});});
export default router;
