package sn.cryptoplatform.course.internal;

import org.springframework.stereotype.Component;

import sn.cryptoplatform.user.Role;
import sn.cryptoplatform.user.UserService;

/** Qui peut modifier un cours : son auteur et les administrateurs. */
@Component
class CourseAccess {

	private final UserService users;

	CourseAccess(UserService users) {
		this.users = users;
	}

	boolean canManage(long userId, Course course) {
		return course.getAuthorId() == userId || isAdmin(userId);
	}

	boolean isAdmin(long userId) {
		return users.findById(userId).map(user -> user.roles().contains(Role.ADMIN)).orElse(false);
	}

	/** Peut être auteur d'un cours : créateur ou administrateur actif. */
	boolean canAuthor(long userId) {
		return users.findById(userId)
				.filter(user -> user.isActive())
				.map(user -> user.roles().contains(Role.CREATOR) || user.roles().contains(Role.ADMIN))
				.orElse(false);
	}
}
