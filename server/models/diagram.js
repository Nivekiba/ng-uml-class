import mongoose from "mongoose";

const Class = mongoose.model("Class")
const Link = mongoose.model("Link")

let DiagramSchema = new mongoose.Schema({
    title: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
 });
  

DiagramSchema.pre('remove', function (next) {
    Class.remove({ diagramId: this._id }).exec();
    Link.remove({ diagramId: this._id }).exec();
    next();
 })
  
 DiagramSchema.methods.toDto = function () {
    return {
        id: this._id,
        title: this.title,
        classes: this.classes.map((clas) => {
            return clas.toDto();
        }),
        links: this.links.map((link) => {
            return link.toDto();
        })
    }
 };
  
 var diagram = mongoose.model('Diagram', DiagramSchema);
 module.exports = diagram;