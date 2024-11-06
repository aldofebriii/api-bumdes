import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export default class Persediaan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Perusahaan, (p) => p.persediaan)
  @JoinColumn()
  perusahaan: Perusahaan;

  @Column('varchar', { nullable: true })
  sku: string;

  @Column()
  nama_barang: string;

  @Column()
  kuantitas: number;

  @Column('double')
  harga_beli_barang: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
