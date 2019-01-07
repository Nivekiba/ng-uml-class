import mongoose from "mongoose";

const Property = mongoose.model("Property")

let ClassSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // une classe simple ou une interface,
    diagram: { type: mongoose.Schema.Types.ObjectId, ref: "Diagram" },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
 }, { collection: "classes" });
  

ClassSchema.pre('remove', function(next) {
    Property.remove({ classId: this._id }).exec();
    next();
 });
  
 ClassSchema.methods.toDto = function () {
    return {
        id: this._id,
        name: this.name,
        type: this.type,
        properties: this.properties.map((prop) => {
            return prop.toDto();
        })
    }
 };
  
 var classs = mongoose.model('Class', ClassSchema);
 module.exports = classs;