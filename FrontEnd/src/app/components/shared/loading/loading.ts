import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.html',
  styleUrls: ['./loading.css']
})
export class Loading {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'white' | 'gray' = 'primary';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
}
