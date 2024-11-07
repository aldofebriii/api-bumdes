import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Perusahaan } from "./perusahaan.entity";

@Entity()
export class Pimpinan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column()
  alamat: string;

  @ManyToOne(() => Perusahaan, (p) => p.pimpinan, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  perusahaan: Perusahaan;
}