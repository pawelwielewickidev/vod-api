package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
