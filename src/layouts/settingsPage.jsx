import React from 'react'
import BasicSettings from '../components/settings/basicSettings'

export default class SettingsPage extends React.Component{
    render() {
        return <div>
            <h1>Settings</h1>
                <BasicSettings></BasicSettings>
            </div>
    }
}