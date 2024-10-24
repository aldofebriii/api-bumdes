import { Perusahaan } from "src/perusahaan/perusahaan.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity()
export class Anggota {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nama: string
    
    @Column({ unique: true })
    email: string
    
    @Column()
    nomor_telepon: string

    @Column()
    roles: string
    
    @Column({ unique: true })
    kata_sandi: string

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Bagian untuk relasi tabel
    @ManyToOne(() => Perusahaan, (a) => a.anggota)
    @JoinColumn()
    perusahaan: Perusahaan;
}