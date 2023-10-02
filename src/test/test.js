const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

const should = chai.should();
chai.use(chaiHttp);

let firstAuthToken = null;
let secondAuthToken = null;
let firstTaskId = null

describe('Task manager tests', () => {
	userModel.deleteMany({}).catch(function(error){
		console.log(error);
	});
	taskodel.deleteMany({}).catch(function(error){
		console.log(error);
	});

  it(`1) User1 user registration with validation error`, (done) => {
    const user = {
      name: 'User1',
      age: 25,
      email: 'example',
      password: 'qwerty1234'
    }

    const code = 403

    chai.request(app)
      .post('/user/')
      .send(user)
      .end((err, res) => {
        res.should.have.status(code);

        done();
        });
    });

  it(`2) User1 user registration without errors`, (done) => {
    const user = {
      name: 'User1',
      age: 25,
      email: 'example@gmail.com',
      password: 'qwerty1234'
    }

    const code = 200

    chai.request(app)
      .post('/user/')
      .send(user)
      .end((err, res) => {
        res.should.have.status(code);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');

        done();
      });
  });

  it(`3) User2 user registration without errors`, (done) => {
    const user = {
      name: 'User2',
      age: 12,
      email: 'user2@gmail.com',
      password: 'mypass1'
    }

    chai.request(app)
      .post('/user/')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');

        done();
      });
  });

  it('4) Login as User1 with valid data', (done) => {
    const user = {
      email: 'example@gmail.com',
      password: 'qwerty1234'
    }

    chai.request(app)
      .post('/user/login')
      .send({email: user.email, password: user.password})
      .end((err, res) => {
        res.should.have.status(200);

        firstAuthToken = res.body.token;

        done();
      });
  });

  it('5) Adding a task Task1', (done) => {
    const task = {
      description: "task 1",
      completed: false
    }

    const code = 200;

    chai.request(app)
      .post('/task/')
      .set({'Authorization': firstAuthToken})
      .send(task)
      .end((err, res) => {
        res.should.have.status(code);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');

        firstTaskId = res.body._id;
        done();
      });
  });

  it('6) Adding a task Task2', (done) => {
    const task = {
      description: "task 2",
      completed: false
    }

    chai.request(app)
      .post('/task/')
      .set({'Authorization': firstAuthToken})
      .send(task)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');

        done();
      });
  });

  it(`7) Getting User1's tasks`, (done) => {
    const code = 200;
    const length = 2;

    chai.request(app)
      .get('/tasks/')
      .set({'Authorization': firstAuthToken})
      .end((err, res) => {
        res.should.have.status(code);
        res.body.should.be.a('array');
        res.body.should.be.lengthOf(length);

        done();
      });
  });

  it(`8) Getting Task1 by id as User1`, (done) => {
    const taskId = firstTaskId;

    const code = 200;

    chai.request(app)
      .get(`/task/${taskId}`)
      .set({'Authorization': firstAuthToken})
      .end((err, res) => {
        res.should.have.status(code);
        res.body.should.be.a('object');
        res.body.should.have.property('description');
        res.body.should.have.property('completed');

        done();
      });
  });

  it('9) Logout User1', (done) => {
    chai.request(app)
      .post('/user/logout')
      .set({'Authorization': firstAuthToken})
      .end((err, res) => {
        res.text.should.be.eql('Logout success!');

        done();
      });
  });

  it('10) Login as User2 with valid data', (done) => {
    const user = {
      email: 'user2@gmail.com',
      password: 'mypass1'
    }

    chai.request(app)
      .post('/user/login')
      .send({email: user.email, password: user.password})
      .end((err, res) => {
        res.should.have.status(200);

        secondAuthToken = res.body.token;

        done();
      });
  });

  it('11) Adding a task Task3', (done) => {
    const task = {
      description: "task 3",
      completed: true
    }

    const code = 200;

    chai.request(app)
      .post('/task/')
      .set({'Authorization': secondAuthToken})
      .send(task)
      .end((err, res) => {
        res.should.have.status(code);
        res.body.should.be.a('object');
        res.body.should.have.property('_id');

        done();
      });
  });

  it(`12) Getting User2's tasks`, (done) => {
    const code = 200;
    const length = 1;

    chai.request(app)
      .get('/tasks/')
      .set({'Authorization': secondAuthToken})
      .end((err, res) => {
        res.should.have.status(code);
        res.body.should.be.a('array');
        res.body.should.be.lengthOf(length);

        done();
      });
  });

  it(`13) Getting Task1 by id as User2`, (done) => {
    const taskId = firstTaskId;

    const code = 404;

    chai.request(app)
      .get(`/task/${taskId}`)
      .set({'Authorization': secondAuthToken})
      .end((err, res) => {
        res.should.have.status(code);

        done();
      });
  });

  it('14) Logout User2', (done) => {
    chai.request(app)
      .post('/user/logout')
      .set({'Authorization': secondAuthToken})
      .end((err, res) => {
        res.text.should.be.eql('Logout success!');

        done();
      });
  });

  it(`15) Getting Task1 by id as User2`, (done) => {
    const taskId = '62c2c8dac761eb60e6c17ded';

    const code = 401;

    chai.request(app)
      .get(`/task/${taskId}`)
      .set({'Authorization': secondAuthToken})
      .end((err, res) => {
        res.should.have.status(code);

        done();
      });
  });
});