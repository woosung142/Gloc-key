data "aws_availability_zones" "available" {
  state = "available"
}

output "aws_azs" {
  value = data.aws_availability_zones.available.names
}