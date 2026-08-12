import { LightningElement } from 'lwc';

export default class TeamTasks extends LightningElement {
    valuePriority = '';

    get optionsPriority() {
        return [
            { label: 'choose priority...', value: '' },
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
        ];
    }

    handleChangePriority(event) {
        this.valuePriority = event.detail.value;
    }
}