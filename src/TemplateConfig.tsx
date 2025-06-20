

import {
    DashboardOutlined,
    TeamOutlined
} from '@ant-design/icons';
import logo from "./assets/images/LWV_Logo2_500x337_rgb.jpg";

import { MenuItem } from "@digitalaidseattle/mui";
import packageJson from "../package.json";

export const TemplateConfig = () => {
    const dashboard = {
        id: 'group-dashboard',
        title: 'Navigation',
        type: 'group',
        children: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                type: 'item',
                url: '/',
                icon: <DashboardOutlined />
            }
        ]
    } as MenuItem;

    const pages = {
        id: 'example',
        title: 'Examples',
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
        menuItems: [dashboard, pages],
        toolbarItems: [],
        version: packageJson.version,
    });
}