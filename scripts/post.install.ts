import 'reflect-metadata';
import { AppConfig } from './app.config.json';
import { Container } from 'inversify';
import { Bind, SetJsonDefaults } from '@trankzachary/pipeline';

const container = new Container();
Bind(container, 'azimuth-connection-factory')
    .register(container, SetJsonDefaults, AppConfig, false, 'app.config.json')
    .run(container)
    .subscribe(() => {});