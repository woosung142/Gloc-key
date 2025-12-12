package gloc_key_project.gloc_key.entity;

import jakarta.persistence.*;
import lombok.*;
@Builder
@Getter
@Setter
@Entity
@AllArgsConstructor // 전체 필드 생성자 추가
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "gloc_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    private String role;
}
