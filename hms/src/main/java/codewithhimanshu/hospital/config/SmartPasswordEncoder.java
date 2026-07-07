package codewithhimanshu.hospital.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class SmartPasswordEncoder implements PasswordEncoder {

	private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

	@Override
	public String encode(CharSequence rawPassword) {

		return bcrypt.encode(rawPassword);
	}

	@Override
	public boolean matches(CharSequence rawPassword, String encodedPassword) {
		if (encodedPassword != null && encodedPassword.startsWith("$2")) {
			return bcrypt.matches(rawPassword, encodedPassword);
		}
		return rawPassword != null && rawPassword.toString().equals(encodedPassword);
	}
}