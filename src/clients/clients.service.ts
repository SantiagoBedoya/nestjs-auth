import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const currentClient = await this.clientModel.findOne({
      name: createClientDto.name,
    });
    if (currentClient) {
      throw new BadRequestException('name already in use');
    }
    const client = await this.clientModel.create({
      ...createClientDto,
      secret: uuid(),
    });
    return client;
  }

  async findAll() {
    const clients = await this.clientModel.find();
    return clients;
  }

  async findOne(id: string) {
    const client = await this.clientModel.findById(id);
    if (!client) throw new NotFoundException();
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    await this.clientModel.findByIdAndUpdate(client._id, updateClientDto);
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    await this.clientModel.findByIdAndDelete(client._id);
  }
}
