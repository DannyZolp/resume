export interface IResume {
    name: string;
    email: string;
    phone: string;
    location: string;
    skills: {
        name: string;
        is_hobby: boolean;
        start: Date;
    }[];
    jobs: {
        organization: string;
        position: string;
        roles: string[];
        location: string;
        start: Date;
        end?: Date;
    }[];
    education: {
        degree: string;
        institution: string;
        location: string;
        start: Date;
        end?: Date;
    }[];
    research: {
        topic: string;
        institution: string;
        points: string[];
        start: Date;
        end?: Date;
    }[];
}
