import mongoose from 'mongoose';
const opts = { timestamps: true };
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true}, role:{type:String,default:'User',enum:['User']},
  status:{type:String,default:'Active',enum:['Active','Blacklisted']}
},opts);
const staffSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true}, contactDetails:{type:String,required:true,unique:true,trim:true},
  passwordHash:{type:String,required:true}, role:{type:String,default:'Staff'},
  status:{type:String,default:'Pending',enum:['Pending','Approved','Rejected','Blacklisted']}
},opts);
const adminSchema = new mongoose.Schema({
  name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},
  passwordHash:{type:String,required:true},role:{type:String,default:'Admin'}
},opts);
const trekSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},location:{type:String,default:''},difficulty:{type:String,enum:['Easy','Moderate','Difficult'],required:true},
  duration:{type:Number,required:true,min:1},availableSlots:{type:Number,required:true,min:0},
  assignedStaff:{type:mongoose.Schema.Types.ObjectId,ref:'TrekStaff',default:null},
  status:{type:String,enum:['Pending','Approved','Open','Started','Completed'],default:'Pending'},
  startDate:{type:Date,required:true},endDate:{type:Date,required:true},imageUrl:{type:String,default:''},imageFilename:{type:String,default:''},description:{type:String,default:''},detailedDescription:{type:String,default:''},
  region:{type:String,required:true},price:{type:Number,required:true,min:0},
  avgTime:{type:String,default:''},avgDistance:{type:String,default:''},avgGain:{type:String,default:''},avgLoss:{type:String,default:''}
},opts);
const bookingSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},trek:{type:mongoose.Schema.Types.ObjectId,ref:'Trek',required:true},
  bookingDate:{type:Date,default:Date.now},status:{type:String,enum:['Booked','Cancelled','Completed'],default:'Booked'}
},opts);
bookingSchema.index({user:1,trek:1},{unique:true});
export const User=mongoose.model('User',userSchema);
export const TrekStaff=mongoose.model('TrekStaff',staffSchema);
export const Admin=mongoose.model('Admin',adminSchema);
export const Trek=mongoose.model('Trek',trekSchema);
export const Booking=mongoose.model('Booking',bookingSchema);
