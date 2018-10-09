import { FormControl } from '@angular/forms';
export class PasswordValidator {
	static isMatch(control: FormControl): any {
		if (control.value == control.root.value['pwd']) {
			console.log('passwords  match');
			return null;
		} else {
			return { 'notMatch': true };
		}
	}
}