import mongoose from "mongoose";

let TaskSchema = new mongoose.Schema({
    content: { type: String, maxlength: 200 },
    state: { type: Boolean, default: false },
    todo: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }
 }, { timestamps: true });
  
  
 TaskSchema.methods.toDto = function () {
    return {
        id: this._id,
        content: this.content,
        state: this.state
    }
 };
  
 mongoose.model('Task', TaskSchema);