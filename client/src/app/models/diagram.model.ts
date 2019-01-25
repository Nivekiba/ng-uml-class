import { Class } from "./class.model";
import { Link } from "./link.model";

export class Diagram {
  public id: String;
  public title;
  public classes: Class[];
  public links: Link[];
}
