import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionDetails } from './collection-details';

describe('CollectionDetails', () => {
  let component: CollectionDetails;
  let fixture: ComponentFixture<CollectionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
