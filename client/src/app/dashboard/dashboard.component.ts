import { DataService } from './../data/data.service';
import {Component, ViewChild, AfterViewInit, ElementRef, OnInit} from '@angular/core';
import {Post} from '../Post';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../auth.service';
import { LoginService } from "../login-component/login.service";
import { DiagramDialogComponent } from "../diagram-dialog/diagram-dialog.component";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import { Diagram } from "../models/diagram.model";

import * as go from "src/assets/go.js"


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit{

  myDiagram: go.Diagram;
  myPalette: go.Palette;
  title: String;

  @ViewChild('graphContainer') graphContainer: ElementRef;
  @ViewChild('paletteContainer') paletteContainer: ElementRef;

  diagrams: Diagram[];
  currentDiag: Diagram;

  constructor(public dialog: MatDialog, private dataService: DataService, public auth: LoginService, private snackBar: MatSnackBar) {
    this.dataService.getDiagrams().subscribe(result => {
      this.diagrams = result["diagrams"]
      console.log(result["diagrams"])
    })
  }

  ngOnInit(){
  }

  ngAfterViewInit(){
    var $ = go.GraphObject.make;
    this.myDiagram = $(go.Diagram, this.graphContainer.nativeElement,
      {
        grid: $(go.Panel, "Grid",
          { gridCellSize: new go.Size(8, 8) },
          $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
          $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 })
        ),
        // layout: $(go.GridLayout , { spacing: new go.Size(200,100) }),
        "LinkDrawn": changeLinkType,     // these two DiagramEvents call a
        "LinkRelinked": changeLinkType,
        "draggingTool.dragsLink": true,
        "ExternalObjectsDropped":afterDragging,
        "draggingTool.isGridSnapEnabled": true,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 20,
        "relinkingTool.fromHandleArchetype":
        $(go.Shape, "Diamond", { segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "tomato", stroke: "darkred" }),
        "relinkingTool.toHandleArchetype":
        $(go.Shape, "Diamond", { segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8), fill: "darkred", stroke: "tomato" }),
        "linkReshapingTool.handleArchetype":
        $(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" })
      });
        var myDiagram = this.myDiagram;
        /*var nodeDataArray = [
          { key: "alpha", properties: [{p: "1p"}, {p: "2p"}], methods: [{name: "test", visibility:"public", parameters: [ {p: "testtt"}, {p: "25"} ] }, {name:"know"}] },
          { key: "beta", properties: [{p: "3p"}, {p: "4p"}]  },
          { key: -1, category: "LinkLabel" }
        ];

        var linkDataArray = [
          { key: "un bon lien", to: "beta", from: "alpha", toCard: "1..*", fromCard:"*", labelKeys: [ -1 ] }
        ];*/
        // myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
        myDiagram.undoManager.isEnabled = true;

        myDiagram.addModelChangedListener(evt => {
          // ignore unimportant Transaction events
          if (!evt.isTransactionFinished) return;
          var txn = evt.object;  // a Transaction
          if (txn === null) return;
          // iterate over all of the actual ChangedEvents of the Transaction
          txn.changes.each(e => {
              // ignore any kind of change other than adding/removing a node
              if (e.modelChange === "nodeDataArray") {
                  // record node insertions and removals
                  if (e.change === go.ChangedEvent.Insert) {
                      // console.log(evt.propertyName + " added node with id: " + e.newValue.id);
                      this.dataService.saveClass(this.currentDiag.id, "Class1", "class").subscribe(res => {
                        myDiagram.model.commit(m => {
                          m.set(e.newValue, "key", res["id"])
                          m.set(e.newValue, "name", res["name"])

                          this.currentDiag.classes.push(res)
                        })
                      })
                  } else if (e.change === go.ChangedEvent.Remove) {
                      // console.log(evt.propertyName + " removed node with id: " + e.oldValue.id);
                      this.dataService.deleteClass(e.oldValue.key).subscribe(res => {})
                      this.currentDiag.classes = this.currentDiag.classes.filter(c => c.id != e.oldValue.key)
                  }
              }
              if (e.modelChange === "linkDataArray")
              {
                  if (e.change === go.ChangedEvent.Insert) {
                      // console.log(evt.propertyName + " added link between nodes : " + myDiagram.findNodeForKey(e.newValue.from).data.id + " and " + myDiagram.findNodeForKey(e.newValue.to).data.id);
                  } else if (e.change === go.ChangedEvent.Remove) {
                      // console.log(evt.propertyName + " removed link between nodes: " + myDiagram.findNodeForKey(e.oldValue.from).data.id + " and " + myDiagram.findNodeForKey(e.oldValue.to).data.id);
                  }
              }
          });
        })
        /*myDiagram.addModelChangedListener(e => {
            if (e.change === go.ChangedEvent.Remove) {
              if (e.modelChange === "linkDataArray") {
                console.log("remove link")
              }else if (e.modelChange === "nodeDataArray"){
                console.log("remove node")
              }
            } else if (e.change === go.ChangedEvent.Insert) {
              if (e.modelChange === "linkDataArray") {
                console.log("add link")
              }else if (e.modelChange === "nodeDataArray"){
                console.log("add node")
              }
            }
        })*/

        myDiagram.allowDrop = true;
        myDiagram.linkTemplate =
          $(go.Link,
            { relinkableFrom: true, relinkableTo: true, reshapable: true},
            {
              curve: go.Link.JumpOver,
              corner: 5,
              toShortLength: 4
            },
            new go.Binding("points").makeTwoWay(),
            $(go.Shape, new go.Binding("strokeDashArray", "type", function(t){ return (t=="relassoc")? [4, 4] : [] })),
            $(go.Shape, { toArrow: "", fill: "white", scale: 1.3 }, new go.Binding("toArrow", "type", this.convertType)),
            $(go.TextBlock, { isMultiline: false, editable: true }, new go.Binding("text", "name"), { segmentOffset: new go.Point(0,-10) }),
            $(go.TextBlock, { isMultiline: false, editable: true }, new go.Binding("text", "toCard"), { segmentIndex: 0, segmentFraction: 0.12, segmentOffset: new go.Point(0, -10) }),
            $(go.TextBlock, { isMultiline: false, editable: true }, new go.Binding("text", "fromCard"), { segmentIndex: -1, segmentFraction: 0.12, segmentOffset: new go.Point(0, -10) })
          )

        var propertyTemplate =
          $(go.Panel, "Horizontal",
          $(go.TextBlock,"-",
            { isMultiline: false, width: 12, click: changeVisibility },
            new go.Binding("text", "visibility", convertVisibility)),
          $(go.TextBlock,
            { isMultiline: false, editable: true },
            new go.Binding("text", "p"))
          );
        function convertVisibility(v){
          switch(v){
            case "public": return "+";
            case "private": return "-";
            case "protected": return "#";
            default: return "~";
          }
        }
        function changeVisibility(e){
          console.log("==>", e)
        }
        var methodTemplate =
          $(go.Panel, "Horizontal",
          $(go.TextBlock,"+",
            { isMultiline: false, width: 12, click: changeVisibility },
            new go.Binding("text", "visibility", convertVisibility)),
          $(go.TextBlock,
            { isMultiline: false, editable: true },
            new go.Binding("text", "name")),
          $(go.TextBlock,"()",
            { isMultiline: false, editable: true },
            new go.Binding("text", "parameters", function(params){
            var s="(";
            for(var e in params){s+=params[e].p+", "}
            s=s.substr(0, s.length-2)
            return s+")";
            }))
          );

        var cxElement = document.getElementById("contextMenu")

          var myContextMenu = $(go.HTMLInfo, {
          show: showContextMenu,
          mainElement: cxElement
          });

          cxElement.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            return false;
          }, false);

         function showContextMenu(obj, diagram, tool) {
          // Show only the relevant buttons given the current state.
          var cmd = diagram.commandHandler;
          document.getElementById("addp").style.display = "block";
          document.getElementById("addm").style.display = "block";
          document.getElementById("remp").style.display = "block";
          document.getElementById("remm").style.display = "block";
          // Now show the whole context menu element
          cxElement.style.display = "block";
          // we don't bother overriding positionContextMenu, we just do it here:
          var mousePt = diagram.lastInput.viewPoint;
          cxElement.style.left = (mousePt.x + cxElement.style.width) + "px";
          cxElement.style.top = mousePt.y + "px";
        }

        function changeClassName(tb, old, currentText){
          var data = tb.part.data
          console.log(this.currentDiag.classes)
          console.log(data.key)
          this.dataService.updateClass(data.key, currentText, data.type).subscribe(e => {
            var clas = this.currentDiag.classes.filter(x => x.id == data.key)[0]
            clas.name = currentText;
          })
        }

        myDiagram.nodeTemplate =
          $(go.Node, "Auto",
            $(go.Shape, "Rectangle",
              { fill: "lightyellow",
                portId: "",
                fromLinkable: true,
                toLinkable: true,
                cursor: "pointer"
              }),
            $(go.Panel, "Table",
              $(go.RowColumnDefinition, { column: 0, width: 150 }),
              $(go.Shape, "Rectangle",
                { row: 1, column: 0, fill: "lightyellow",
                width: 150, height: 20,
                minSize: new go.Size(150, 10) }),
              $(go.TextBlock, "Class",new go.Binding("text", "name"), {
                name: "className", isMultiline: false, editable: true, row: 1, alignment: go.Spot.Center, font:"bold 12pt sans-serif" ,
                textEdited: changeClassName.bind(this)
              }),
              $(go.Shape, "Rectangle",
                { row: 3, column: 0, fill: "lightyellow",
                width: 150, height: 0,
                minSize: new go.Size(150, 0) }),
              $(go.Panel, "Vertical",
                new go.Binding("itemArray", "methods"),
                {
                  row: 4, column: 0,
                  width: 150, defaultAlignment: go.Spot.Left,
                  padding: 10,
                  minSize: new go.Size(150, 5) ,
                  itemTemplate: methodTemplate
                }),
              $(go.Panel, "Vertical", { name: "PROPERTIES" },
                new go.Binding("itemArray", "properties"),
                {
                  row: 2, margin: 3, padding: 10, stretch: go.GraphObject.Fill,
                  defaultAlignment: go.Spot.Left, background: "lightyellow",
                  itemTemplate: propertyTemplate
                }
                ),
              ),
              {
              contextMenu: myContextMenu
                 /*$("ContextMenu",
                  $("ContextMenuButton",
                    $(go.TextBlock, "Add Method"),
                    { click: addMethod }),
                  $("ContextMenuButton",
                    $(go.TextBlock, "Add Property"),
                    { click: addProperty }),
                  $("ContextMenuButton",
                    $(go.TextBlock, "Remove Method"),
                    { click: removeMethod }),
                  $("ContextMenuButton",
                    $(go.TextBlock, "Remove Property"),
                    { click: removeProperty })
                  )*/
              }
          );
          myDiagram.nodeTemplateMap.add("LinkLabel",
          $("Node",
            { selectable: false, avoidable: false,
              layerName: "Foreground" },  // always have link label nodes in front of Links
            $("Shape", "Ellipse",
              { width: 5, height: 5, stroke: null,
                portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer" })
          ));
          myDiagram.model.linkLabelKeysProperty =  "labelKeys";

          function afterDragging(e){
            var link = e.subject;
            e.subject.each(function(node){
              link = node
            })
            if(link.data.type && link.data.type=="association"){
              e.diagram.model.commit(function(m){
                var id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                m.set(link.data, "labelKeys", [id]);

                var nod = {key: id, category: "LinkLabel"}
                m.addNodeData(nod);
                var noe = m.nodeDataArray[m.nodeDataArray.length - 1]
                m.set(noe, "labeledLink", link.data);
                m.addLabelKeyForLinkData(link.data, id)
              })
            }
          }
          function changeLinkType(e){
            var link = e.subject
            if(!link.fromNode || !link.toNode) return;

            var linktolink = (link.fromNode.isLinkLabel || link.toNode.isLinkLabel);
            if(linktolink){
              e.diagram.model.set(link.data, "type", "relassoc");
              var key = link.fromNode.data.key
              var links = myDiagram.model.linkDataArray.filter(e => e.labelKeys.indexOf(key) >= 0)
              e.diagram.model.set(link.toNode.data, "key", links[0].key);
            }
          }

        // Whenever a new Link is drawng by the LinkingTool, it also adds a node data object
        // that acts as the label node for the link, to allow links to be drawn to/from the link.
        myDiagram.toolManager.linkingTool.archetypeLabelNodeData = { category: "LinkLabel" };
    this.initPalette();
  }
  initPalette(){
    var $ = go.GraphObject.make;
    var myDiagram = this.myDiagram;
    this.myPalette =
		  $(go.Palette, this.paletteContainer.nativeElement,  // must name or refer to the DIV HTML element
			{
			  layout: $(go.GridLayout, {  spacing: new go.Size(100,50) }),
        nodeTemplate:
        $(go.Node, "Auto",
          $(go.Shape, "Rectangle",
              { fill: "lightyellow",
                portId: "",
                fromLinkable: true,
                toLinkable: true,
                cursor: "pointer"
              }),
            $(go.Panel, "Table",
              $(go.RowColumnDefinition, { column: 0, width: 80 }),
              $(go.Shape, "Rectangle",
                { row: 1, column: 0, fill: "lightyellow",
                width: 80, height: 20,
                minSize: new go.Size(80, 10) }),
              $(go.TextBlock, "Class"),
              $(go.Shape, "Rectangle",
                { row: 3, column: 0, fill: "lightyellow",
                width: 80, height: 0,
                minSize: new go.Size(80, 0) }),
              $(go.Panel, "Vertical",
                {
                  row: 2, margin: 3, padding: 10, stretch: go.GraphObject.Fill,
                  defaultAlignment: go.Spot.Left, background: "lightyellow"
                }
                ),
              )
          )
        ,
			  //nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
			  linkTemplate: // simplify the link template, just in this Palette
				$(go.Link,
				  {
  					routing: go.Link.AvoidsNodes,
  					curve: go.Link.JumpOver,
  					corner: 5,
  					toShortLength: 4
				  },
				  new go.Binding("points"),
				  $(go.Shape,  // the link path shape
            new go.Binding("strokeDashArray", "type", function(t){ return (t=="relassoc")?[3, 2]:"" }),
					{ isPanelMain: true, strokeWidth: 1 }),
				  $(go.Shape,  // the arrowhead
          { toArrow: "Triangle", fill: "white" },
          new go.Binding("toArrow", "type", this.convertType)),
          $(go.TextBlock, new go.Binding("text", "type", function(t){ return (t=="relassoc")?"Relation \nd'association":t }), { segmentOffset: new go.Point(40,0) })
				),
			  model: new go.GraphLinksModel([  // specify the contents of the Palette
          { key: "Class", properties: [] },
			  ], [
  				// the Palette also has a disconnected Link, which the user can drag-and-drop
  				{ key: "d", name:"default",  type: "association", toCard: "*", fromCard:"*", points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
  				{ key: "a", type: "heritage", points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
  				{ key: "b", type: "aggregation", points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
			  ])
      });
  }
  convertType(r){
    switch (r) {
      case "heritage": return "Triangle";
      case "aggregation": return "StretchedDiamond";
      default: return "";
    }
  }
  addMethod(e, obj){
    var myDiagram = this.myDiagram;
    myDiagram.selection.each(obj => {
      myDiagram.model.commit(m => {
        var key = obj.part.data.key

        var methods = obj.part.data.methods || [];
        var name = "method"+(methods.length)

        methods.push({name: "method"+(methods.length), parameters: [{p: "params"}]})
        m.set(obj.part.data, "methods", [])
        m.set(obj.part.data, "methods", methods)

        this.dataService.saveProperty(key, name,  "meth", "public").subscribe(res => {
          this.currentDiag.classes.filter(x => x.id == key)[0].properties.push(res)
        })

      })
    })
    myDiagram.currentTool.stopTool();
  }

  addProperty(e, obj){
    var myDiagram = this.myDiagram;
    myDiagram.selection.each(obj => {
      myDiagram.model.commit(m => {
        var key = obj.part.data.key

        var props = obj.part.data.properties || [];
        var name = "prop"+(props.length)
        props.push({p: "prop"+(props.length) })

        m.set(obj.part.data, "properties", [])
        m.set(obj.part.data, "properties", props)

        this.dataService.saveProperty(key, name,  "prop", "private").subscribe(res => {
          this.currentDiag.classes.filter(x => x.id == key)[0].properties.push(res)
        })
      })
    })
    myDiagram.currentTool.stopTool();
  }

  removeMethod(e, obj){
    var myDiagram = this.myDiagram;
    myDiagram.selection.each(function(obj){
      myDiagram.model.commit(function(m){
        var methods = obj.part.data.methods || [];
        methods = methods.slice(0, methods.length-1)
        m.set(obj.part.data, "methods", [])
        m.set(obj.part.data, "methods", methods)
      })
    })
    myDiagram.currentTool.stopTool();
  }

  removeProperty(e){
    var myDiagram = this.myDiagram;
    myDiagram.selection.each(function(obj){
      myDiagram.model.commit(function(m){
        var props = obj.part.data.properties || [];
        props = props.slice(0, props.length-1)
        m.set(obj.part.data, "properties", [])
        m.set(obj.part.data, "properties", props)
      })
    })
    myDiagram.currentTool.stopTool();
  }

  addDiagram(): void{
    const dialogRef = this.dialog.open(DiagramDialogComponent, {
      data: {title: ""}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.title = result;
        this.dataService.saveDiagram(this.title).subscribe(res => {
          this.diagrams.push(res)
          this.snackBar.open("Diagram created", "", { duration: 2000 })
        })
      }
    });
  }
  editDiagram(id: String): void{
    var diag = this.diagrams.filter(x => x.id == id)[0]

    const dialogRef = this.dialog.open(DiagramDialogComponent, {
      data: { title: diag.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        var diag = this.diagrams.filter(x => x.id == id)[0]
        diag.title = result;
        this.dataService.updateDiagram(diag).subscribe(res => {
          this.snackBar.open("Diagram renamed", "", { duration: 2000 })
        })
      }
    });
  }
  deleteDiagram(id: String){
  var x = confirm("Do you really want to delete ?")
   if(x){
     this.dataService.deleteDiagram(id).subscribe(res => {
        this.diagrams = this.diagrams.filter(x => x.id != id)
        this.snackBar.open("Diagram deleted", "", { duration: 2000 })
     }, err => {
       console.log(err)
       this.diagrams = this.diagrams.filter(x => x.id != id)
       this.snackBar.open("Diagram deleted", "", { duration: 2000 })
     })
   }
  }

  loadDiagram(id: String){
    this.currentDiag = this.diagrams.filter(x => x.id == id)[0]
    var nodeData = [];
    var linkData = [];
    var nodes = this.currentDiag.classes
    var links = this.currentDiag.links
    for(var i=0; i<nodes.length; i++){
      nodeData.push({
        key: nodes[i].id,
        name: nodes[i].name,
        type: nodes[i].type,
        properties: nodes[i].properties.map(pr => {
          if(pr.type == "prop")
          return {
            key: pr.id,
            p: pr.name,
            visibility: pr.visibility
          }
        }),
        methods: nodes[i].properties.map(m => {
          if(m.type == "meth")
          return {
            key: m.id,
            name: m.name,
            visiblity: m.visibility,
            parameters: m.params.map(pr => {
              return {
                key: pr.id,
                p: pr.name,
              }
            })
          }
        })
      })
    }
    for(var i=0; i<links.length; i++){
      linkData.push({
        key: links[i].id,
        from: links[i].class1.id,
        to: links[i].class2.id,
        fromCard: links[i].card1,
        toCard: links[i].card2
      })
    }
    this.myDiagram.model = new go.GraphLinksModel(nodeData, linkData)
    console.log(nodeData)
  }
}
