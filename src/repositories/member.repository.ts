import { injectable } from "inversify";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { Member } from "../entities/member";


export interface IMemberRepository extends IBaseRepository<Member> {
    
}

@injectable()
export class MemberRepository extends BaseRepository<Member> implements IMemberRepository {

}