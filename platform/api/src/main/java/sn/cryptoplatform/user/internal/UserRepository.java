package sn.cryptoplatform.user.internal;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	Optional<User> findByUsernameIgnoreCase(String username);

	boolean existsByUsernameIgnoreCase(String username);
}
