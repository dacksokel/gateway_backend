/**
 * para ayudar a generar ipsv4 y direcciones amc
 */

 "use strict";

 const ipv4 =
   /^(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(?:\.(?!$)|$)){4}$/;
 
 /**
  * Convert an IPv4 to an hexadecimal representation
  * @param  {String} ip   IPv4
  * @return {Integer} hex representation
  */
 const ip2hex = (ip) => {
   let parts = ip.split(".").map((str) => parseInt(str, 10));
   let n = 0;
 
   n += parts[3];
   n += parts[2] * 256; // 2^8
   n += parts[1] * 65536; // 2^16
   n += parts[0] * 16777216; // 2^24
 
   return n;
 };
 
 const assertIpv4 = (str, msg) => {
   if (!ipv4.test(str)) {
     throw new Error(msg);
   }
 };
 
 function* range(ip1, ip2) {
   assertIpv4(ip1, 'argument "ip1" must be a valid IPv4 address');
   assertIpv4(ip2, 'argument "ip2" must be a valid IPv4 address');
 
   let hex = ip2hex(ip1);
   let hex2 = ip2hex(ip2);
 
   if (hex > hex2) {
     let tmp = hex;
     hex = hex2;
     hex2 = tmp;
   }
 
   for (let i = hex; i <= hex2; i++) {
     yield `${(i >> 24) & 0xff}.${(i >> 16) & 0xff}.${(i >> 8) & 0xff}.${
       i & 0xff
     }`;
   }
 }
 
 exports.genSingleIp = (prefix) => {
   for (let ip of range(`192.168.${prefix}.0`, `192.168.${prefix}.10`)) {
     // console.log(ip);
     if(ip != undefined) return ip
   }
 };
 
 exports.genMacs = (prefix) => {
   let mac = prefix || "54:52:00";
 
   for (let i = 0; i < 6; i++) {
     if (i % 2 === 0) mac += ":";
     mac += Math.floor(Math.random() * 16).toString(16);
   }
 
   return mac;
 };
 