// User types and DTO for creating new records

interface User {
    id: number;
    first_name: string;
    last_name: string;
}

interface CreateUserDTO {
    first_name: string;
    last_name: string;
    password: string;
}