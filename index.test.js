const request = require('supertest');
// express app
const app = require('./index');

// db setup
const { sequelize, Dog } = require('./db');
const seed = require('./db/seedFn');
const {dogs} = require('./db/seedData');

function clean_objects(res_obj, db_obj){
    const responseData = Object.assign({}, res_obj, {
        createdAt: undefined,
        updatedAt: undefined,
      });
    const dbData = Object.assign({}, db_obj.toJSON(), {
    createdAt: undefined,
    updatedAt: undefined,
    });
    return [responseData, dbData]
}

describe('Endpoints', () => {
    // to be used in POST test
    const testDogData = {
        breed: 'Poodle',
        name: 'Sasha',
        color: 'black',
        description: 'Sasha is a beautiful black pooodle mix.  She is a great companion for her family.'
    };

    beforeAll(async () => {
        // rebuild db before the test suite runs
        await seed();
    });

    describe('GET /dogs', () => {
        it('should return list of dogs with correct data', async () => {
            // make a request
            const response = await request(app).get('/dogs');
            // assert a response code
            expect(response.status).toBe(200);
            // expect a response
            expect(response.body).toBeDefined();
            // toEqual checks deep equality in objects
            expect(response.body[0]).toEqual(expect.objectContaining(dogs[0]));
        });
    });

    describe('POST /dogs', () => {
        let response;
        it('should successfully create a new dog entry with correct data into the DB', async () => {
            // make a request
            response = await request(app).post('/dogs').send(testDogData)
            // expect matching data
            expect(response.body).toEqual(expect.objectContaining(testDogData))
        })

        it('should match the data in the DB', async () => {
            // get the newly created dog from the database using the id from the response
            const db_dog = await Dog.findByPk(response.body.id);
          
            // create a new object that contains only the properties to compare
            const values = clean_objects(response.body, db_dog)
          
            // compare the two objects
            expect(values[0]).toEqual(values[1]);
          }); 
    })

    describe('DELETE /dogs/:id', () => {
        it('should return null when retrieving the deleted dog entry', async () => {
            // make a request
            const response = await request(app).delete(`/dogs/${1}`);
            // assert a response code
            expect(response.status).toBe(200);
            // find entry with id of 1 from db
            const entry = await Dog.findByPk(1)
            // expect entry to equal null
            expect(entry).toBeNull();
        });
    });
});