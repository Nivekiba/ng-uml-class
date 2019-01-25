import mongoose from "mongoose";

const Property = mongoose.model("Property")

let LinkSchema = new mongoose.Schema({
    class1: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    class2: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    card1: { type: String, required: true },
    card2: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // if the property is either an attribute or a method
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
 });


LinkSchema.pre('remove', function(next)  {
    Property.remove({ linkId: this._id }).exec();
    next();
 })
  
 LinkSchema.methods.toDto = function () {
    return {
        id: this._id,
        name: this.name,
        type: this.type,
        class1: this.class1.toDto(),
        class2: this.class2.toDto(),
        card1: this.card1,
        card2: this.card2,
        properties: this.properties.map(property => {
            return property.toDto()
        })
    }
 };
  
 var link = mongoose.model('Link', LinkSchema);
 module.exports = link;