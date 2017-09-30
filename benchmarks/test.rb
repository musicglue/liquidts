require 'bundler/setup'
require 'benchmark/ips'
require 'json'
require 'liquid/c'

RAW = File.read(File.expand_path('./sample.liquid'))
VARS = JSON.parse(File.read(File.expand_path('./sample.json')))

TMPL = Liquid::Template.parse(RAW)

Benchmark.ips do |x|
  # Configure the number of seconds used during
  # the warmup phase (default 2) and calculation phase (default 5)
  x.config(time: 10, warmup: 2)

  x.report("parsing") { Liquid::Template.parse(RAW) }
  x.report("rendering") { TMPL.render(VARS) }

  # Compare the iterations per second of the various reports!
  x.compare!
end