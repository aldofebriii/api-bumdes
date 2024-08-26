import Persediaan from 'src/persediaan/persediaan.entity';
import Transaksi from 'src/transaksi/transaksi.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Pimpinan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column()
  alamat: string;

  @OneToMany(() => Perusahaan, (p) => p.pimpinan, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  perusahaan: Perusahaan[];
}

@Entity()
export class Perusahaan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nama: string;

  @Column()
  alamat: string;

  @Column()
  email: string;

  @Column()
  kata_sandi: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  //Bagian untuk relasi tabel
  @ManyToOne(() => Pimpinan, (p) => p.perusahaan)
  @JoinColumn()
  pimpinan: Pimpinan;

  @OneToMany(() => Transaksi, (t) => t.perusahaan)
  transaksi: Transaksi[];

  @OneToMany(() => Persediaan, (p) => p.perusahaan)
  persediaan: Persediaan[];
}
