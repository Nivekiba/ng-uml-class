import mongoose from "mongoose";

let PropertySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // if the property is either an attribute or a method
    params: [{type: String, required: true}],
    visibility: {type: String, required: true},
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' }
 }, { collection: "properties" });

 PropertySchema.methods.toDto = function () {
    return {
        id: this._id,
        name: this.name,
        type: this.type,
        params: this.params,
        visibility: this.visibility
    }
 };
  
 var property = mongoose.model('Property', PropertySchema);
 module.exports = property;