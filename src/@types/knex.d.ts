// eslint-disable-next-line
// ou faça apenas:
// import 'knex'

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      username: string;
      password: string;
    };
    meals: {
      meal_id: string;
      description: string;
      created_at: string;
      is_on_diet: boolean;
      author: string;
    };
  }
}
