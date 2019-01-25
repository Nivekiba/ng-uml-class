import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

export interface DialogData {
  title: string;
}

@Component({
  selector: 'app-diagram-dialog',
  templateUrl: './diagram-dialog.component.html',
  styleUrls: ['./diagram-dialog.component.css']
})
export class DiagramDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DiagramDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
