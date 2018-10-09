import {FormControl} from '@angular/forms';
export class UserNameValidator {
	static isValid(control:FormControl): any{
	    let regExp = /^[a-zA-Z0-9.\-_$@*!]{3,30}$/;
        if (!regExp.test(control.value)) {
            return {"invalidUserName": true};
        }
        return null;
	}
}