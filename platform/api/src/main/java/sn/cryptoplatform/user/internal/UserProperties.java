package sn.cryptoplatform.user.internal;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * @param adminEmails adresses qui reçoivent le rôle ADMIN dès qu'elles sont vérifiées
 *                    (amorçage du premier administrateur, variable ADMIN_EMAILS)
 */
@ConfigurationProperties("app.users")
public record UserProperties(@DefaultValue List<String> adminEmails) {
}
