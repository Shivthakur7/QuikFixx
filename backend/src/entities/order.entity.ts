import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Point } from 'geojson';
import { User } from './user.entity';
import { Provider } from './provider.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Provider, { nullable: true })
  provider: Provider;

  @Column({ type: 'uuid', nullable: true })
  providerId: string;

  @Column({ nullable: true }) // Can be linked to ServiceCategory entity later
  serviceType: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Index()
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 8 })
  locationLat: number;

  @Column('decimal', { precision: 11, scale: 8 })
  locationLng: number;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  locationGeo: Point;

  @Column({ nullable: true })
  address: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceEstimated: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceFinal: number;

  @Column({ nullable: true })
  startJobOtp: string;

  @Column({ nullable: true })
  endJobOtp: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
