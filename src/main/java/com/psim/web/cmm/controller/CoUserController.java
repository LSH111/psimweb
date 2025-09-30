package com.psim.web.cmm.controller;

import com.psim.web.cmm.service.CoUserService;
import com.psim.web.cmm.vo.CoUserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class CoUserController {

    @Autowired
    private CoUserService coUserService;

    @GetMapping
    public List<CoUserVO> getAllUsers() {
        return coUserService.getAllUsers();
    }

    @GetMapping("/{userId}")
    public CoUserVO getUserById(@PathVariable String userId) {
        return coUserService.getUserById(userId);
    }

    @PostMapping
    public void addUser(@RequestBody CoUserVO user) {
        coUserService.addUser(user);
    }

    @PutMapping("/{userId}")
    public void editUser(@PathVariable String userId, @RequestBody CoUserVO user) {
        user.setUserId(userId);
        coUserService.editUser(user);
    }

    @DeleteMapping("/{userId}")
    public void removeUser(@PathVariable String userId) {
        coUserService.removeUser(userId);
    }
}
