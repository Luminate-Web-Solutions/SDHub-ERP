// evaluated-result.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evaluated-result',
  template: `
    <ngx-extended-pdf-viewer 
      [src]="pdfUrl"
      [useBrowserLocale]="true"
      style="height: 100vh">
    </ngx-extended-pdf-viewer>
  `
})
export class EvaluatedResultComponent implements OnInit {
  pdfUrl!: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const pdfName = this.route.snapshot.paramMap.get('pdfName');
    this.pdfUrl = `./pdf/${pdfName}`;
  }
}