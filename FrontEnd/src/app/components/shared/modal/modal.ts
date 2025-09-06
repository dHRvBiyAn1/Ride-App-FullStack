import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.html',
  styleUrls: ['./modal.css']
})
export class Modal implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closable = true;
  @Input() showFooter = true;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonClass = 'btn-primary';
  @Input() confirmDisabled = false;
  @Input() loading = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit(): void {
    // Prevent body scroll when modal is open
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Restore body scroll
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closable && event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    if (this.closable && !this.loading) {
      document.body.style.overflow = '';
      this.close.emit();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    if (!this.loading) {
      this.cancel.emit();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closable && !this.loading) {
      this.onClose();
    }
  }
}
