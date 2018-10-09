import {FormControl} from '@angular/forms';
export class PhoneValidator {
    static isValid(control:FormControl): any{
        let regExp = /^[0-9]{10}$/;

        if (!regExp.test(control.value)) {
            return {"invalidMobile": true};
        }

        return null;
    }
}