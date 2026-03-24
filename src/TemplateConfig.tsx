

import {
    FileTextOutlined,
    TeamOutlined,
    UserOutlined
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
                id: 'committees',
                title: 'Committees',
                type: 'item',
                url: '/committees',
                icon: <TeamOutlined />
            } as MenuItem,
            {
                id: 'legislators',
                title: 'Legislators',
                type: 'item',
                url: '/legislators',
                icon: <UserOutlined />
            } as MenuItem,
            {
                id: 'bills',
                title: 'Bills',
                type: 'item',
                url: '/bills',
                icon: <FileTextOutlined />
            } as MenuItem
        ]
    } as MenuItem;

    return ({
        appName: 'League of Women Voters',
        logoUrl: logo,
        drawerWidth: 240,
        menuItems: [pages],
        toolbarItems: [],
        version: packageJson.version,
    });
}
