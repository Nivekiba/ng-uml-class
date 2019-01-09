import mongoose from "mongoose";

const Diagram = mongoose.model("Diagram")

let UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String,  required: true },
    name: { type: String,  required: true },
    sexe: { type: String, required: true },
    diagrams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Diagram' }]
 });
  
UserSchema.methods.comparePassword = function(passw, cb){
    var isMatch = this.password == passw;
    cb(null, isMatch);
}

UserSchema.pre('remove', (next) => {
    Diagram.remove({ userId: this._id }).exec();
    next();
 })
  
 UserSchema.methods.toDto = function () {
    return {
        id: this._id,
        username: this.username,
        name: this.name,
        sexe: this.sexe,
        diagrams: this.diagrams.map((diagram) => {
            return diagram.toDto();
        })
    }
 };
  
 var user = mongoose.model('User', UserSchema);
 module.exports = user;