import { ForceDirectedLayout, GridLayout, TextBlock, Binding, ToolManager, Diagram, LinkingTool } from './../../go.d';
import {Component, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import {DataService} from '../data/data.service';
import {Post} from '../Post';
import {DataSource} from '@angular/cdk/table';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../auth.service';
import { LoginService } from "../login-component/login.service";
import {PostDialogComponent} from '../post-dialog/post-dialog.component';
import {MatDialog} from '@angular/material';
import * as go from "src/assets/go.js"

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit{

  myDiagram: go.Diagram;
  myPalette: go.Palette;
  @ViewChild('graphContainer') graphContainer: ElementRef;
  @ViewChild('paletteContainer') paletteContainer: ElementRef;


  constructor(public dialog: MatDialog, private dataService: DataService, public auth: LoginService) {
  }

  ngAfterViewInit(){
    var $ = go.GraphObject.make;
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
        "ExternalObjectsDropped":afterDraggingAddLabelNode,
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
        var nodeDataArray = [
          { key: "alpha", properties: [{p: "1p"}, {p: "2p"}], methods: [{name: "test", visibility:"public", parameters: [ {p: "testtt"}, {p: "25"} ] }, {name:"know"}] },
          { key: "beta", properties: [{p: "3p"}, {p: "4p"}]  },
          { key: -1, category: "LinkLabel" }
        ];

        var linkDataArray = [
          { key: "un bon lien", to: "beta", from: "alpha", toCard: "1..*", fromCard:"*", labelKeys: [ -1 ] }
        ];
        myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
        myDiagram.undoManager.isEnabled = true;

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
            $(go.TextBlock, { isMultiline: false, editable: true }, new go.Binding("text", "key"), { segmentOffset: new go.Point(0,-10) }),
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
              $(go.TextBlock, "Class",new go.Binding("text", "key"), { isMultiline: false, editable: true, row: 1, alignment: go.Spot.Center, font:"bold 12pt sans-serif" }),
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
          function afterDraggingAddLabelNode(e){
            var link = e.subject;
            e.subject.each(function(node){
              link = node
            })
            if(link.data.type && link.data.type=="association"){
              var id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
              e.diagram.model.set(link.data, "labelKeys", [id]);
              e.diagram.model.addNodeData({key: id, category: "LinkLabel"});
              console.log(link.part)
              myDiagram.currentTool =  myDiagram.toolManager.linkingTool
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
  				{ key: "default", type: "association", toCard: "*", fromCard:"*", points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
  				{ key: "", type: "heritage", points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) },
  				{ key: "", type: "aggregation", points: new go.List(/*go.Point*/).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)]) }
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
    myDiagram.selection.each(function(obj){
      myDiagram.model.commit(function(m){
        var methods = obj.part.data.methods || [];
        methods.push({name: "method"+(methods.length), parameters: [{p: "params"}]})
        m.set(obj.part.data, "methods", [])
        m.set(obj.part.data, "methods", methods)
      })
    })
    myDiagram.currentTool.stopTool();
  }

  addProperty(e, obj){
    var myDiagram = this.myDiagram;
    myDiagram.selection.each(function(obj){
      myDiagram.model.commit(function(m){
        var props = obj.part.data.properties || [];
        props.push({p: "prop"+(props.length)})
        m.set(obj.part.data, "properties", [])
        m.set(obj.part.data, "properties", props)
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
}
