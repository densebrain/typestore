"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Log = require('../../log');
var ModelDecorations_1 = require("../../ModelDecorations");
var log = Log.create(__filename);
var Test1 = (function () {
    function Test1() {
        log.info("constructor for " + this.constructor.name);
    }
    __decorate([
        ModelDecorations_1.AttributeDescriptor({ name: 'field1' }), 
        __metadata('design:type', String)
    ], Test1.prototype, "attrStr1", void 0);
    __decorate([
        ModelDecorations_1.AttributeDescriptor({ name: 'field2' }), 
        __metadata('design:type', String)
    ], Test1.prototype, "attrStr2", void 0);
    Test1 = __decorate([
        ModelDecorations_1.ModelDescriptor({ tableName: 'testTable1' }), 
        __metadata('design:paramtypes', [])
    ], Test1);
    return Test1;
}());
exports.Test1 = Test1;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvZml4dHVyZXMvVGVzdDEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQVksR0FBRyxXQUFNLFdBQ3JCLENBQUMsQ0FEK0I7QUFDaEMsaUNBQW1ELHdCQUF3QixDQUFDLENBQUE7QUFFNUUsSUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUdsQztJQVFDO1FBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBb0IsSUFBSSxDQUFDLFdBQW1CLENBQUMsSUFBTSxDQUFDLENBQUE7SUFDOUQsQ0FBQztJQVJEO1FBQUMsc0NBQW1CLENBQUMsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDLENBQUM7OzJDQUFBO0lBR3JDO1FBQUMsc0NBQW1CLENBQUMsRUFBQyxJQUFJLEVBQUMsUUFBUSxFQUFDLENBQUM7OzJDQUFBO0lBTnRDO1FBQUMsa0NBQWUsQ0FBQyxFQUFDLFNBQVMsRUFBQyxZQUFZLEVBQUMsQ0FBQzs7YUFBQTtJQVkxQyxZQUFDO0FBQUQsQ0FYQSxBQVdDLElBQUE7QUFYWSxhQUFLLFFBV2pCLENBQUEiLCJmaWxlIjoidGVzdC9maXh0dXJlcy9UZXN0MS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIExvZyBmcm9tICcuLi8uLi9sb2cnXG5pbXBvcnQge01vZGVsRGVzY3JpcHRvciwgQXR0cmlidXRlRGVzY3JpcHRvcn0gZnJvbSBcIi4uLy4uL01vZGVsRGVjb3JhdGlvbnNcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZShfX2ZpbGVuYW1lKVxuXG5ATW9kZWxEZXNjcmlwdG9yKHt0YWJsZU5hbWU6J3Rlc3RUYWJsZTEnfSlcbmV4cG9ydCBjbGFzcyBUZXN0MSB7XG5cblx0QEF0dHJpYnV0ZURlc2NyaXB0b3Ioe25hbWU6J2ZpZWxkMSd9KVxuXHRhdHRyU3RyMTpzdHJpbmdcblxuXHRAQXR0cmlidXRlRGVzY3JpcHRvcih7bmFtZTonZmllbGQyJ30pXG5cdGF0dHJTdHIyOnN0cmluZ1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdGxvZy5pbmZvKGBjb25zdHJ1Y3RvciBmb3IgJHsodGhpcy5jb25zdHJ1Y3RvciBhcyBhbnkpLm5hbWV9YClcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvVXNlcnMvamdsYW56L0RldmVsb3BtZW50L2R5bm90eXBlL3NyYyJ9
