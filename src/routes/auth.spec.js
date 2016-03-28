import { request } from '../spec-utils';
import { User } from '../models';


describe('Authentication endpoint', function() {
    before(async function() {
        let user = User.build({
            id: 'auth_test',
        });
        await user.setPassword('test_pwd');
        await user.save();
    });

    after(async function() {
        await User.destroy({ where: { id: 'auth_test' } });
    });

    it('authenticates by username and password', async function() {
        let resp = await request.post('api/auth/', {
            username: 'auth_test',
            password: 'test_pwd',
        });
        expect(resp.data.token).not.to.be.null; // eslint-disable-line
        expect(resp.data.exp).not.to.be.null; // eslint-disable-line
    });

    it('rejects a non-existent user', async function() {
        await expect(request.post('api/auth/', {
            username: 'invalid_user',
            password: 'gibberish',
        }))
            .to.be.rejected.and.eventually.have.property('status', 401);
    });

    it('rejects an incorrect password', async function() {
        await expect(request.post('api/auth/', {
            username: 'auth_test',
            password: 'gibberish',
        }))
            .to.be.rejected.and.eventually.have.property('status', 401);
    });

    it('renews a token', async function() {
        let resp = await request.post('api/auth/', {
            username: 'auth_test',
            password: 'test_pwd',
        });
        let token = resp.data.token;
        await new Promise(resolve => setTimeout(resolve, 1000));
        resp = await request.post('api/auth/', {
            token: token,
        });
        expect(resp.data.token).not.to.be.null; // eslint-disable-line
        expect(resp.data.token).not.to.equal(token);
    });

    it('rejects an invalid request', async function() {
        await expect(request.post('api/auth/', {
            gibberish: 'true',
        }))
            .to.be.rejected.and.eventually
                .include({ status: 400 }).and
                .have.deep.property('data.error.message').which.matches(/gibberish/);

        await expect(request.post('api/auth/', {
            username: 'no_password',
        }))
            .to.be.rejected.and.eventually
                .include({ status: 400 }).and
                .have.deep.property('data.error.message').which.matches(/password/);
    });
});
