import {UserProfile, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}
  async verifyCredentials(credentials: Credentials): Promise<User> {
    //
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound(
        `user not found with this ${credentials.email}`,
      );
    }

    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      foundUser.password,
    );
    //console.log(credentials.password);
    //console.log(foundUser.password);
    //console.log(passwordMatched);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('password is not valid');
    }
    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if (user.nombre) {
      userName = user.nombre;
    }
    if (user.apellido) {
      userName = user.nombre
        ? `${user.nombre} ${user.apellido}`
        : user.apellido;
    }
    return {id: `${user.id}`, name: userName}
  }
}
