import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Point } from 'geojson';
import { User } from './user.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.provider, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'text', default: 'NONE' }) // NONE, PENDING, APPROVED, REJECTED
  verificationStatus: string;

  @Column({ type: 'text', nullable: true })
  aadhaarCardUrl: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  currentLocation: Point;

  @Column({ nullable: true })
  address: string;

  @Column('text', { array: true, default: [] })
  skillTags: string[];

  @Column('decimal', { precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0.00 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
