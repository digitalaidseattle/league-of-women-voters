

import {
    ChromeOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import logo from "./assets/images/logo-light-icon.svg";

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
                id: 'sample-page',
                title: 'Sample Page',
                type: 'item',
                url: '/sample-page',
                icon: <ChromeOutlined />
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