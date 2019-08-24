import 'reflect-metadata';
import { AppConfig } from './app.config.json';
import { Container } from 'inversify';
import { Bind, SetJsonDefaults } from '@trankzachary/post-install-scripts';

const container = new Container();
Bind(container)
    .register(container, SetJsonDefaults, AppConfig, false, 'app.config.json')
    .run(container)
    .subscribe(() => {});