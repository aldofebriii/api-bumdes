import Persediaan from "src/persediaan/persediaan.entity";
import Transaksi from "src/transaksi/transaksi.entity";
import { User } from "src/user/user.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity()
export class Pimpinan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column()
  alamat: string;

  @OneToOne(() => Perusahaan, (p) => p.pimpinan, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  perusahaan: Perusahaan[];
}

@Entity()
export class Perusahaan {
    @PrimaryGeneratedColumn({})
    id: number;

    @Column({ unique: true })
    nama: string
    
    @Column()
    email: string
    
    @Column()
    alamat: string

    @Column()
    nomor_telepon: string


    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Bagian untuk relasi tabel
    @OneToMany(() => User, (u) => u.perusahaan)
    @JoinColumn()
    user: User;

    //Bagian untuk relasi tabel
    @OneToMany(() => Transaksi, (t) => t.perusahaan, { onDelete: 'CASCADE' })
    transaksi: Transaksi[];

    @OneToMany(() => Persediaan, (p) => p.perusahaan, { onDelete: 'CASCADE' })
    persediaan: Persediaan[];

    @ManyToOne(()=> Pimpinan, (p) => p.perusahaan, { onDelete: 'CASCADE' })
    pimpinan: Pimpinan;
    
}