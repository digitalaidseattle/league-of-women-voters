

import {
    TeamOutlined
} from '@ant-design/icons';
import logo from "./assets/images/LWV_Logo2_500x337_rgb.jpg";

import { MenuItem } from "@digitalaidseattle/mui";
import packageJson from "../package.json";

export const TemplateConfig = () => {
    const pages = {
        id: 'example',
        type: 'group',
        children: [
            {
                id: 'committees-page',
                title: 'Committees',
                type: 'item',
                url: '/committees-page',
                icon: <TeamOutlined />
            } as MenuItem,
            {
                id: 'sponsors-page',
                title: 'Sponsors',
                type: 'item',
                url: '/sponsors-page',
                icon: <TeamOutlined />
            } as MenuItem
        ]
    } as MenuItem;

    return ({
        appName: 'League of Women Voters',
        logoUrl: logo,
        drawerWidth: 240,
        menuItems: [ pages],
        toolbarItems: [],
        version: packageJson.version,
    });
}